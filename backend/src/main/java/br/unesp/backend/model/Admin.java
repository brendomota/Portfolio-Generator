package br.unesp.backend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Entity
@DiscriminatorValue("ADMIN")
@NoArgsConstructor
public class Admin extends Usuario {

    public Admin(String login, String email, String senha) {
        super(login, email, senha, UserRole.ADMIN);
    }

    @Override
    public List<? extends GrantedAuthority> getAuthorities() {
        // Um Admin acumula os dois papéis: é ADMIN e também USER comum
        return List.of(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("ROLE_USER")
        );
    }
}
