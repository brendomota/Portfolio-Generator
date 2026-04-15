package br.unesp.backend.repository;

import br.unesp.backend.model.Curriculo;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CurriculoRepository extends CrudRepository<Curriculo, Long> {

}
