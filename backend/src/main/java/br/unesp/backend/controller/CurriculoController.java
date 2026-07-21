package br.unesp.backend.controller;

import br.unesp.backend.model.Curriculo;
import br.unesp.backend.model.CurriculoDadosIA;
import br.unesp.backend.model.Skill;
import br.unesp.backend.model.Usuario;
import br.unesp.backend.repository.CurriculoRepository;
import br.unesp.backend.repository.SkillRepository;
import br.unesp.backend.service.IaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController("CurriculoController")
@RequestMapping(value = "/curriculo")
public class CurriculoController {
    @Autowired
    private CurriculoRepository curriculoRepository;

    @Autowired
    private IaService iaService;

    @Autowired
    private SkillRepository skillRepository;

    // Converte o texto "Java, React, SQL" na relação N:N Curriculo <-> Skill.
    // Reaproveita skills já existentes no banco e cria as que faltarem.
    private void sincronizarSkills(Curriculo curriculo) {
        List<Skill> skills = new ArrayList<>();
        String texto = curriculo.getSkillsExtraidas();
        if (texto != null) {
            Arrays.stream(texto.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .forEach(nome -> {
                        Skill skill = skillRepository.findByNome(nome);
                        if (skill == null) {
                            skill = skillRepository.save(new Skill(nome));
                        }
                        skills.add(skill);
                    });
        }
        curriculo.setSkills(skills);
    }

    @GetMapping(value = "/", produces = "application/json")
    public ResponseEntity<List<Curriculo>> getAllCurriculos() {
        List<Curriculo> list = (List<Curriculo>) curriculoRepository.findAll();
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @GetMapping(value = "/publico/{login}", produces = "application/json")
    public ResponseEntity<Curriculo> getCurriculoPublicoPorLogin(
            @PathVariable(value = "login") String login) {

        List<Curriculo> todos = (List<Curriculo>) curriculoRepository.findAll();
        return todos.stream()
                .filter(c -> c.getUsuario() != null && login.equals(c.getUsuario().getLogin()))
                .reduce((a, b) -> b)
                .map(c -> new ResponseEntity<>(c, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Curriculo> getCurriculoById(
            @PathVariable(value = "id") Long id) {

        Optional<Curriculo> curriculo = curriculoRepository.findById(id);

        if (!curriculo.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(curriculo.get(), HttpStatus.OK);
    }

    @PostMapping(value = "/", consumes = "multipart/form-data", produces = "application/json")
    public ResponseEntity<Curriculo> saveCurriculo(
            @RequestParam("conteudoTexto") String conteudoTexto,
            @RequestParam("arquivoPdf") MultipartFile arquivoPdf,
            @AuthenticationPrincipal Usuario usuarioAutenticado) {

        try {
            byte[] pdfBytes = arquivoPdf.isEmpty() ? new byte[0] : arquivoPdf.getBytes();

            // Send PDF to AI and extract structured data
            CurriculoDadosIA dadosIA = iaService.extrairDadosDoCurriculo(pdfBytes);

            Curriculo curriculo = new Curriculo();
            curriculo.setConteudoTexto(conteudoTexto);
            // O dono do currículo é SEMPRE quem está autenticado pelo Bearer Token,
            // nunca um id que o cliente possa enviar (evita IDOR / criar currículo em nome de outro usuário)
            curriculo.setUsuario(usuarioAutenticado);
            curriculo.setArquivoPdf(pdfBytes);

            // Populate AI-extracted fields
            curriculo.setNomeExtraido(dadosIA.nome());
            curriculo.setEmailExtraido(dadosIA.email());
            curriculo.setLinkedinExtraido(dadosIA.linkedin());
            curriculo.setGithubExtraido(dadosIA.github());
            curriculo.setLocalizacaoExtraida(dadosIA.localizacao());
            curriculo.setResumoExtraido(dadosIA.resumo());
            curriculo.setSkillsExtraidas(dadosIA.skills());
            curriculo.setSkillsInterpessoaisExtraidas(dadosIA.skillsInterpessoais());
            curriculo.setExperienciasExtraidas(dadosIA.experiencias());
            curriculo.setEducacaoExtraida(dadosIA.educacao());
            curriculo.setProjetosExtraidos(dadosIA.projetos());
            curriculo.setIdiomasExtraidos(dadosIA.idiomas());

            // Popula a relação N:N a partir das skills extraídas pela IA
            sincronizarSkills(curriculo);

            Curriculo curriculoSalvo = curriculoRepository.save(curriculo);

            return new ResponseEntity<>(curriculoSalvo, HttpStatus.CREATED);

        } catch (Exception e) {
            System.out.println("Erro ao salvar currículo: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Curriculo> updateCurriculo(
            @PathVariable(value = "id") Long id,
            @RequestBody Curriculo curriculoAtualizado,
            @AuthenticationPrincipal Usuario usuarioAutenticado) {

        Optional<Curriculo> curriculoExistente = curriculoRepository.findById(id);

        if (!curriculoExistente.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Curriculo curriculo = curriculoExistente.get();

        // O id na URL identifica o CURRÍCULO (recurso), não o usuário — mas antes de
        // mexer nele, confirmamos que o dono bate com quem o Bearer Token identifica.
        if (curriculo.getUsuario() == null ||
                !curriculo.getUsuario().getLogin().equals(usuarioAutenticado.getLogin())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        curriculo.setConteudoTexto(curriculoAtualizado.getConteudoTexto());
        curriculo.setArquivoPdf(curriculoAtualizado.getArquivoPdf());
        // O dono nunca é reatribuído a partir do corpo da requisição — permanece o mesmo.

        Curriculo curriculoSalvo = curriculoRepository.save(curriculo);

        return new ResponseEntity<>(curriculoSalvo, HttpStatus.OK);
    }

    @PatchMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Curriculo> patchCurriculo(
            @PathVariable(value = "id") Long id,
            @RequestBody Curriculo curriculoAtualizado,
            @AuthenticationPrincipal Usuario usuarioAutenticado) {

        Optional<Curriculo> curriculoExistente = curriculoRepository.findById(id);

        if (!curriculoExistente.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Curriculo curriculo = curriculoExistente.get();

        if (curriculo.getUsuario() == null ||
                !curriculo.getUsuario().getLogin().equals(usuarioAutenticado.getLogin())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        if (curriculoAtualizado.getFotoPerfil() != null) {
            curriculo.setFotoPerfil(curriculoAtualizado.getFotoPerfil());
        }
        if (curriculoAtualizado.getImagemFundo() != null) {
            curriculo.setImagemFundo(curriculoAtualizado.getImagemFundo());
        }
        if (curriculoAtualizado.getFavicon() != null) {
            curriculo.setFavicon(curriculoAtualizado.getFavicon());
        }
        if (curriculoAtualizado.getTemaFundo() != null) {
            curriculo.setTemaFundo(curriculoAtualizado.getTemaFundo());
        }
        if (curriculoAtualizado.getConteudoTexto() != null) {
            curriculo.setConteudoTexto(curriculoAtualizado.getConteudoTexto());
        }
        if (curriculoAtualizado.getArquivoPdf() != null) {
            curriculo.setArquivoPdf(curriculoAtualizado.getArquivoPdf());
        }
        // O dono nunca é reatribuível pelo corpo da requisição — senão qualquer editor
        // do currículo poderia "transferi-lo" para outro usuário via PATCH.
        if (curriculoAtualizado.getNomeExtraido() != null) {
            curriculo.setNomeExtraido(curriculoAtualizado.getNomeExtraido());
        }
        if (curriculoAtualizado.getEmailExtraido() != null) {
            curriculo.setEmailExtraido(curriculoAtualizado.getEmailExtraido());
        }
        if (curriculoAtualizado.getLinkedinExtraido() != null) {
            curriculo.setLinkedinExtraido(curriculoAtualizado.getLinkedinExtraido());
        }
        if (curriculoAtualizado.getGithubExtraido() != null) {
            curriculo.setGithubExtraido(curriculoAtualizado.getGithubExtraido());
        }
        if (curriculoAtualizado.getLocalizacaoExtraida() != null) {
            curriculo.setLocalizacaoExtraida(curriculoAtualizado.getLocalizacaoExtraida());
        }
        if (curriculoAtualizado.getResumoExtraido() != null) {
            curriculo.setResumoExtraido(curriculoAtualizado.getResumoExtraido());
        }
        if (curriculoAtualizado.getSkillsExtraidas() != null) {
            curriculo.setSkillsExtraidas(curriculoAtualizado.getSkillsExtraidas());
            // Mantém a relação N:N coerente com o texto editado pelo usuário
            sincronizarSkills(curriculo);
        }
        if (curriculoAtualizado.getSkillsInterpessoaisExtraidas() != null) {
            curriculo.setSkillsInterpessoaisExtraidas(curriculoAtualizado.getSkillsInterpessoaisExtraidas());
        }
        if (curriculoAtualizado.getExperienciasExtraidas() != null) {
            curriculo.setExperienciasExtraidas(curriculoAtualizado.getExperienciasExtraidas());
        }
        if (curriculoAtualizado.getEducacaoExtraida() != null) {
            curriculo.setEducacaoExtraida(curriculoAtualizado.getEducacaoExtraida());
        }
        if (curriculoAtualizado.getProjetosExtraidos() != null) {
            curriculo.setProjetosExtraidos(curriculoAtualizado.getProjetosExtraidos());
        }
        if (curriculoAtualizado.getIdiomasExtraidos() != null) {
            curriculo.setIdiomasExtraidos(curriculoAtualizado.getIdiomasExtraidos());
        }

        Curriculo curriculoSalvo = curriculoRepository.save(curriculo);

        return new ResponseEntity<>(curriculoSalvo, HttpStatus.OK);
    }

    @DeleteMapping(value = "/{id}", produces = "application/text")
    public ResponseEntity<Curriculo> deleteCurriculo(
            @PathVariable(value = "id") Long id,
            @AuthenticationPrincipal Usuario usuarioAutenticado) {

        Optional<Curriculo> curriculoExistente = curriculoRepository.findById(id);

        if (!curriculoExistente.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Curriculo curriculo = curriculoExistente.get();

        if (curriculo.getUsuario() == null ||
                !curriculo.getUsuario().getLogin().equals(usuarioAutenticado.getLogin())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        curriculoRepository.deleteById(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
