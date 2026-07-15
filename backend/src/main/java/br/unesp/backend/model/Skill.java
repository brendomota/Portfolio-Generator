package br.unesp.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true)
    private String nome;

    // Lado inverso do N:N — uma skill aparece em vários currículos.
    // @JsonIgnore evita loop infinito na serialização (Curriculo -> Skill -> Curriculo -> ...)
    @ManyToMany(mappedBy = "skills")
    @JsonIgnore
    private List<Curriculo> curriculos;

    public Skill(String nome) {
        this.nome = nome;
    }
}
