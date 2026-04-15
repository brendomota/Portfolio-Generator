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


    @Lob //Essa anotação é para indicar ao BD que ele deve armazenar um arquivo grande
    private byte[] arquivoPdf;

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
