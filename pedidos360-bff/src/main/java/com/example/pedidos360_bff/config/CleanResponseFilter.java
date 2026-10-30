package com.example.pedidos360_bff.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class CleanResponseFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        CleanWrapper wrapper = new CleanWrapper((HttpServletResponse) response);
        chain.doFilter(request, wrapper);
    }

    static class CleanWrapper extends HttpServletResponseWrapper {
        public CleanWrapper(HttpServletResponse response) { super(response); }

        @Override
        public void setHeader(String name, String value) {
            if (!"Transfer-Encoding".equalsIgnoreCase(name)) super.setHeader(name, value);
        }

        @Override
        public void addHeader(String name, String value) {
            if (!"Transfer-Encoding".equalsIgnoreCase(name)) super.addHeader(name, value);
        }
    }
}
