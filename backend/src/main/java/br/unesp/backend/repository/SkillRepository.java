package br.unesp.backend.repository;

import br.unesp.backend.model.Skill;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillRepository extends CrudRepository<Skill, Long> {
    // Query method: o Spring Data deriva o SQL a partir do nome do método
    Skill findByNome(String nome);
}
