package com.example.pedidos360_bff.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug-token")
public class TokenDebugController {

    private static final Logger log = LoggerFactory.getLogger(TokenDebugController.class);

    @GetMapping
    public ResponseEntity<Map<String, Object>> verTokenPorDentro(@AuthenticationPrincipal Jwt jwt) {
        log.info("BFF: Recibida solicitud de debug de token JWT");
        
        if (jwt == null) {
            Map<String, Object> errorResp = new HashMap<>();
            errorResp.put("status", "UNAUTHENTICATED");
            errorResp.put("mensaje", "No se proporcionó token JWT en la cabecera Authorization: Bearer <token>");
            return ResponseEntity.status(401).body(errorResp);
        }
        
        Map<String, Object> tokenDesarmado = new HashMap<>();
        
        // 1. Mostrar toda la informaciÃ³n cruda del token
        tokenDesarmado.put("claimsCompletos", jwt.getClaims());
        
        // 2. Extraer la identidad especÃ­fica (Lo que pidiÃ³ el profe)
        String correoUsuario = jwt.getClaimAsString("preferred_username");
        if (correoUsuario == null) {
            correoUsuario = jwt.getClaimAsString("upn");
        }
        
        Map<String, Object> identidadExtraida = new HashMap<>();
        identidadExtraida.put("usuarioExtraido", correoUsuario);
        identidadExtraida.put("nombreReal", jwt.getClaimAsString("name"));
        identidadExtraida.put("rolesAsignados", jwt.getClaimAsStringList("roles"));
        identidadExtraida.put("idAzureOid", jwt.getClaimAsString("oid"));
        
        tokenDesarmado.put("identidadProcesadaParaBD", identidadExtraida);
        tokenDesarmado.put("mensaje", "Este es el token desarmado desde el Backend Spring Boot. Se usa 'preferred_username' para filtrar los pedidos de este usuario exacto en la BD.");

        log.debug("BFF: Token JWT procesado para usuario: {}", correoUsuario);
        return ResponseEntity.ok(tokenDesarmado);
    }
}
