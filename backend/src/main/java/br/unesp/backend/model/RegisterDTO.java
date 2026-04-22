package br.unesp.backend.model;

public record RegisterDTO(String login, String password, String email, UserRole role) {
}
