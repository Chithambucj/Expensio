package com.expense.tracker.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalCorsFilter implements Filter {

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        HttpServletResponse res =
                (HttpServletResponse) response;

        HttpServletRequest req =
                (HttpServletRequest) request;

        String origin = req.getHeader("Origin");
        if (origin != null && (origin.equals("http://localhost:4200") || origin.endsWith("netlify.app"))) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            res.setHeader("Access-Control-Allow-Origin", "https://expensio-tracking.netlify.app");
        }

        res.setHeader(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS"
        );

        res.setHeader(
                "Access-Control-Allow-Headers",
                "*"
        );

        res.setHeader(
                "Access-Control-Allow-Credentials",
                "true"
        );

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {

            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(request, response);
    }
}
