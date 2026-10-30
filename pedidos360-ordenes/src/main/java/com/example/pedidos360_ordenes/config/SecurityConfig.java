package com.example.pedidos360_ordenes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher("/h2-console/**")).permitAll()
                .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher("/actuator/**")).permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        org.springframework.core.convert.converter.Converter<org.springframework.security.oauth2.jwt.Jwt, java.util.Collection<org.springframework.security.core.GrantedAuthority>> authoritiesConverter = jwt -> {
            java.util.Set<org.springframework.security.core.GrantedAuthority> authorities = new java.util.HashSet<>();
            
            // 1. Extraer roles de claim 'roles' de Azure AD si existen
            java.util.List<String> roles = jwt.getClaimAsStringList("roles");
            if (roles != null) {
                for (String role : roles) {
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role));
                }
            }
            
            // 2. Mapeo automático de roles según email
            String email = jwt.getClaimAsString("preferred_username");
            if (email == null) email = jwt.getClaimAsString("upn");
            if (email != null) {
                String lower = email.toLowerCase();
                if (lower.startsWith("admin")) {
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_Admin"));
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_Operador"));
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_Cliente"));
                } else if (lower.startsWith("operador")) {
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_Operador"));
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_Cliente"));
                }
            }
            
            // 3. Todo usuario autenticado es al menos Cliente
            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_Cliente"));
            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"));
            
            return authorities;
        };

        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return jwtConverter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
                "https://54.145.51.231",
                "https://3.93.182.109",
                "http://localhost:4200"
        )); // FIX EV1: orÃƒÂ­genes especÃƒÂ­ficos Ã¢â‚¬â€ wildcard + credentials es rechazado por el browser
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
