package com.expense.tracker.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
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

        res.setHeader(
                "Access-Control-Allow-Origin",
                "https://expensio-tracking.netlify.app"
        );

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
