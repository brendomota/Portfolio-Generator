package br.unesp.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Curriculo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String conteudoTexto;

    @Lob
    private byte[] arquivoPdf;

    // Fields populated by the AI after PDF processing
    private String nomeExtraido;
    private String emailExtraido;
    private String linkedinExtraido;
    private String githubExtraido;
    private String localizacaoExtraida;

    @Column(columnDefinition = "TEXT")
    private String resumoExtraido;

    @Column(columnDefinition = "TEXT")
    private String skillsExtraidas;

    @Column(columnDefinition = "TEXT")
    private String skillsInterpessoaisExtraidas;

    @Column(columnDefinition = "TEXT")
    private String experienciasExtraidas;

    @Column(columnDefinition = "TEXT")
    private String educacaoExtraida;

    @Column(columnDefinition = "TEXT")
    private String projetosExtraidos;

    @Column(columnDefinition = "TEXT")
    private String idiomasExtraidos;

    private LocalDateTime dataUpload;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @PrePersist
    protected void onCreate() {
        this.dataUpload = LocalDateTime.now();
    }

    public Curriculo(String conteudoTexto, byte[] arquivoPdf, Usuario usuario) {
        this.conteudoTexto = conteudoTexto;
        this.arquivoPdf = arquivoPdf;
        this.usuario = usuario;
    }
}
