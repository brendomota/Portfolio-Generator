package br.unesp.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import br.unesp.backend.model.Usuario;
import br.unesp.backend.repository.UsuarioRepository;

@Controller("UsuarioController")
@RequestMapping(value = "/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping(value = "/", produces = "application/json")
    public ResponseEntity<List<Usuario>> getAllUsuarios() {

        List<Usuario> list = (List<Usuario>) usuarioRepository.findAll();
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Usuario> getUsuarioById(
            @PathVariable(value = "id") Long id) {

        Optional<Usuario> usuario = usuarioRepository.findById(id);
        return new ResponseEntity<>(usuario.get(), HttpStatus.OK);
    }

    @PostMapping(value = "/", produces = "application/json")
    public ResponseEntity<Usuario> saveUsuario(
            @RequestBody Usuario usuario) {
        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return new ResponseEntity<>(usuarioSalvo, HttpStatus.OK);
    }

    @PutMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Usuario> updateUsuario(
            @PathVariable(value = "id") Long id,
            @RequestBody Usuario usuarioAtualizado) {

        Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);

        if (!usuarioExistente.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Usuario usuario = usuarioExistente.get();

        usuario.setLogin(usuarioAtualizado.getLogin());
        usuario.setEmail(usuarioAtualizado.getEmail());
        usuario.setSenha(usuarioAtualizado.getSenha());

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return new ResponseEntity<>(usuarioSalvo, HttpStatus.OK);
    }

    @PatchMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Usuario> patchUsuario(
            @PathVariable(value = "id") Long id,
            @RequestBody Usuario usuarioAtualizado) {

        Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);

        if (!usuarioExistente.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Usuario usuario = usuarioExistente.get();

        if (usuarioAtualizado.getLogin() != null) {
            usuario.setLogin(usuarioAtualizado.getLogin());
        }

        if (usuarioAtualizado.getEmail() != null) {
            usuario.setEmail(usuarioAtualizado.getEmail());
        }

        if (usuarioAtualizado.getSenha() != null) {
            usuario.setSenha(usuarioAtualizado.getSenha());
        }

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return new ResponseEntity<>(usuarioSalvo, HttpStatus.OK);
    }

    @DeleteMapping(value = "/{id}", produces = "application/text")
    public ResponseEntity<Usuario> deleteUsuario(
            @PathVariable(value = "id") Long id) {
        usuarioRepository.deleteById(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
