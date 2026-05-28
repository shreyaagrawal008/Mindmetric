package com.mindmetric.api.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

@Configuration
public class AuthConfig {
  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
      .cors(Customizer.withDefaults())
      .csrf(csrf -> csrf.disable())
      .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
      .build();
  }

  @Bean
  JwtDecoder googleJwtDecoder(@Value("${google.client.id}") String clientId) {
    NimbusJwtDecoder decoder = NimbusJwtDecoder
      .withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
      .build();
    OAuth2TokenValidator<Jwt> issuer = JwtValidators.createDefaultWithIssuer("https://accounts.google.com");
    OAuth2TokenValidator<Jwt> audience = jwt -> {
      List<String> audiences = jwt.getAudience();
      if (audiences != null && audiences.contains(clientId)) {
        return OAuth2TokenValidatorResult.success();
      }
      return OAuth2TokenValidatorResult.failure(
        new OAuth2Error("invalid_token", "Google token audience does not match this app", null)
      );
    };
    decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(issuer, audience));
    return decoder;
  }
}
