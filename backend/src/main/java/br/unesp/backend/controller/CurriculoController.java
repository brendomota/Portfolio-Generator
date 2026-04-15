package br.unesp.backend.controller;

import br.unesp.backend.model.Curriculo;
import br.unesp.backend.model.Usuario;
import br.unesp.backend.repository.CurriculoRepository;
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
            //aqui é criado uma referência do usuário apenas com o ID para o relacionamento
            Usuario usuario = new Usuario();
            usuario.setId(usuarioId);

            Curriculo curriculo = new Curriculo();
            curriculo.setConteudoTexto(conteudoTexto);
            curriculo.setUsuario(usuario);

            // arquivo recebido vai para o formato byte[]
            if (!arquivoPdf.isEmpty()) {
                curriculo.setArquivoPdf(arquivoPdf.getBytes());
            }

            Curriculo curriculoSalvo = curriculoRepository.save(curriculo);

            return new ResponseEntity<>(curriculoSalvo, HttpStatus.CREATED);

        } catch (Exception e) {
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

        if (curriculoAtualizado.getConteudoTexto() != null) {
            curriculo.setConteudoTexto(curriculoAtualizado.getConteudoTexto());
        }

        if (curriculoAtualizado.getArquivoPdf() != null) {
            curriculo.setArquivoPdf(curriculoAtualizado.getArquivoPdf());
        }

        if (curriculoAtualizado.getUsuario() != null) {
            curriculo.setUsuario(curriculoAtualizado.getUsuario());
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
