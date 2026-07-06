package br.unesp.backend.service;

import br.unesp.backend.model.CurriculoDadosIA;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class IaService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    private static final String GROQ_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    private final ObjectMapper objectMapper = new ObjectMapper();

    public CurriculoDadosIA extrairDadosDoCurriculo(byte[] pdfBytes) {
        try {
            String textoPdf = extrairTextoDoPdf(pdfBytes);
            String respostaJson = chamarGroq(textoPdf);
            return deserializarResposta(respostaJson);
        } catch (Exception e) {
            System.out.println("Erro ao processar currículo com IA: " + e.getMessage());
            // Returns empty data so the upload still succeeds even if AI fails
            return new CurriculoDadosIA("", "", "", "", "", "", "", "", "", "", "", "");
        }
    }

    // Step 1: use PDFBox to extract raw text from the PDF bytes
    private String extrairTextoDoPdf(byte[] pdfBytes) throws Exception {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    // Step 2: send the extracted text to Groq and return the raw response string
    private String chamarGroq(String textoCurriculo) throws Exception {
        String sistemaPrompt = "Você é um analisador de currículos. " +
                "Responda SOMENTE com um JSON válido, sem texto adicional, sem markdown, sem ```json. " +
                "O JSON deve ter exatamente estas 12 chaves: " +
                "nome, email, linkedin, github, localizacao, resumo, skills, skillsInterpessoais, experiencias, educacao, projetos, idiomas. " +
                "Se algum campo não existir no currículo, retorne uma string vazia para ele.";

        String usuarioPrompt = "Analise o currículo abaixo e extraia:\n" +
                "- nome: nome completo\n" +
                "- email: endereço de email\n" +
                "- linkedin: URL ou usuario do linkedin\n" +
                "- github: URL ou usuario do github\n" +
                "- localizacao: cidade e estado\n" +
                "- resumo: resumo ou objetivo profissional em 2-3 linhas\n" +
                "- skills: habilidades técnicas separadas por vírgula\n" +
                "- skillsInterpessoais: habilidades interpessoais separadas por vírgula\n" +
                "- experiencias: experiências profissionais resumidas em texto corrido\n" +
                "- educacao: formações acadêmicas resumidas em texto corrido\n" +
                "- projetos: projetos e realizações resumidos em texto corrido\n" +
                "- idiomas: idiomas separados por vírgula\n\n" +
                "Currículo:\n" + textoCurriculo;

        // Use Jackson to safely serialize strings — handles quotes, newlines and backslashes automatically
        String requestBody = objectMapper.writeValueAsString(
                new java.util.LinkedHashMap<String, Object>() {{
                    put("model", "llama-3.1-8b-instant");
                    put("messages", new Object[]{
                            new java.util.LinkedHashMap<String, String>() {{
                                put("role", "system");
                                put("content", sistemaPrompt);
                            }},
                            new java.util.LinkedHashMap<String, String>() {{
                                put("role", "user");
                                put("content", usuarioPrompt);
                            }}
                    });
                    put("temperature", 0.2);
                }}
        );

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GROQ_URL))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + groqApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("=== GROQ RESPONSE ===");
        System.out.println(response.body());
        System.out.println("=====================");
        return response.body();
    }

    // Step 3: parse Gemini's response envelope and extract our 4-field JSON
    private CurriculoDadosIA deserializarResposta(String respostaGemini) throws Exception {
        JsonNode root = objectMapper.readTree(respostaGemini);

        // Surface API-level errors (e.g. 429 rate limit, invalid key) as exceptions
        if (root.has("error")) {
            String msg = root.path("error").path("message").asText("unknown error");
            throw new RuntimeException("Groq API error: " + msg);
        }

        // Groq wraps the answer inside: choices[0].message.content
        String textoJson = root
                .path("choices").get(0)
                .path("message")
                .path("content")
                .asText();

        // Clean up any accidental markdown the model may have added
        textoJson = textoJson.strip()
                .replaceAll("^```json", "")
                .replaceAll("^```", "")
                .replaceAll("```$", "")
                .strip();

        JsonNode dados = objectMapper.readTree(textoJson);

        return new CurriculoDadosIA(
                dados.path("nome").asText(""),
                dados.path("email").asText(""),
                dados.path("linkedin").asText(""),
                dados.path("github").asText(""),
                dados.path("localizacao").asText(""),
                dados.path("resumo").asText(""),
                dados.path("skills").asText(""),
                dados.path("skillsInterpessoais").asText(""),
                dados.path("experiencias").asText(""),
                dados.path("educacao").asText(""),
                dados.path("projetos").asText(""),
                dados.path("idiomas").asText("")
        );
    }
}
