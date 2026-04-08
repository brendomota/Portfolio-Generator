package br.unesp.backend.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import br.unesp.backend.model.Usuario;

@Repository
public interface UsuarioRepository extends CrudRepository<Usuario, Long> {
    
}
