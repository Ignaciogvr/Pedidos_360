package com.example.pedidos360_bff.config;

import com.example.pedidos360_bff.exception.BadRequestException;
import com.example.pedidos360_bff.exception.ServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Configuration
public class RestTemplateConfig {
    
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(5))
            .setReadTimeout(Duration.ofSeconds(10))
            .errorHandler(new RestTemplateErrorHandler())
            .interceptors(new LoggingInterceptor())
            .build();
    }
    
    static class RestTemplateErrorHandler implements ResponseErrorHandler {
        
        private static final Logger log = LoggerFactory.getLogger(RestTemplateErrorHandler.class);
        
        @Override
        public boolean hasError(ClientHttpResponse response) throws IOException {
            // Solo tratar errores 5xx como errores del BFF
            // Los errores 4xx se deben propagar al cliente tal cual
            return response.getStatusCode().is5xxServerError();
        }
        
        @Override
        public void handleError(ClientHttpResponse response) throws IOException {
            String responseBody = new String(response.getBody().readAllBytes(), StandardCharsets.UTF_8);
            log.error("RestTemplate error - Status: {}, Body: {}", response.getStatusCode(), responseBody);
            
            if (response.getStatusCode().is5xxServerError()) {
                throw new ServiceUnavailableException("Microservicio no disponible: " + responseBody);
            }
        }
    }
    
    static class LoggingInterceptor implements ClientHttpRequestInterceptor {
        
        private static final Logger log = LoggerFactory.getLogger(LoggingInterceptor.class);
        
        @Override
        public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
            log.info("RestTemplate request - Method: {}, URI: {}", request.getMethod(), request.getURI());
            
            ClientHttpResponse response = execution.execute(request, body);
            
            log.info("RestTemplate response - Status: {}", response.getStatusCode());
            return response;
        }
    }
}
