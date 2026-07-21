package br.unesp.backend.security;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

// Configura o Swagger para exibir o botão "Authorize" com um campo de Bearer Token.
// Depois de logar (POST /auth/login) e copiar o token da resposta, cole aqui SEM
// o prefixo "Bearer " — o Swagger adiciona sozinho no header Authorization.
@Configuration
@OpenAPIDefinition(
        info = @Info(title = "PortfólioPro API", version = "1.0"),
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class OpenApiConfig {
}
