package br.unesp.backend.controller;

import br.unesp.backend.model.Curriculo;
import br.unesp.backend.model.CurriculoDadosIA;
import br.unesp.backend.model.Usuario;
import br.unesp.backend.repository.CurriculoRepository;
import br.unesp.backend.service.IaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Controller("CurriculoController")
@RequestMapping(value = "/curriculo")
public class CurriculoController {
    @Autowired
    private CurriculoRepository curriculoRepository;

    @Autowired
    private IaService iaService;

    @GetMapping(value = "/", produces = "application/json")
    public ResponseEntity<List<Curriculo>> getAllCurriculos() {
        List<Curriculo> list = (List<Curriculo>) curriculoRepository.findAll();
        return new ResponseEntity<>(list, HttpStatus.OK);
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
            @RequestParam("usuarioId") Long usuarioId,
            @RequestParam("arquivoPdf") MultipartFile arquivoPdf) {

        try {
            Usuario usuario = new Usuario();
            usuario.setId(usuarioId);

            byte[] pdfBytes = arquivoPdf.isEmpty() ? new byte[0] : arquivoPdf.getBytes();

            // Send PDF to AI and extract structured data
            CurriculoDadosIA dadosIA = iaService.extrairDadosDoCurriculo(pdfBytes);

            Curriculo curriculo = new Curriculo();
            curriculo.setConteudoTexto(conteudoTexto);
            curriculo.setUsuario(usuario);
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
            @RequestBody Curriculo curriculoAtualizado) {

        Optional<Curriculo> curriculoExistente = curriculoRepository.findById(id);

        if (!curriculoExistente.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Curriculo curriculo = curriculoExistente.get();

        curriculo.setConteudoTexto(curriculoAtualizado.getConteudoTexto());
        curriculo.setArquivoPdf(curriculoAtualizado.getArquivoPdf());

        if (curriculoAtualizado.getUsuario() != null) {
            curriculo.setUsuario(curriculoAtualizado.getUsuario());
        }

        Curriculo curriculoSalvo = curriculoRepository.save(curriculo);

        return new ResponseEntity<>(curriculoSalvo, HttpStatus.OK);
    }

    @PatchMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Curriculo> patchCurriculo(
            @PathVariable(value = "id") Long id,
            @RequestBody Curriculo curriculoAtualizado) {

        Optional<Curriculo> curriculoExistente = curriculoRepository.findById(id);

        if (!curriculoExistente.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Curriculo curriculo = curriculoExistente.get();

        if (curriculoAtualizado.getFotoPerfil() != null) {
            curriculo.setFotoPerfil(curriculoAtualizado.getFotoPerfil());
        }
        if (curriculoAtualizado.getImagemFundo() != null) {
            curriculo.setImagemFundo(curriculoAtualizado.getImagemFundo());
        }
        if (curriculoAtualizado.getConteudoTexto() != null) {
            curriculo.setConteudoTexto(curriculoAtualizado.getConteudoTexto());
        }
        if (curriculoAtualizado.getArquivoPdf() != null) {
            curriculo.setArquivoPdf(curriculoAtualizado.getArquivoPdf());
        }
        if (curriculoAtualizado.getUsuario() != null) {
            curriculo.setUsuario(curriculoAtualizado.getUsuario());
        }
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
            @PathVariable(value = "id") Long id) {
        curriculoRepository.deleteById(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
