package com.sclms.sclms_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Value("${DB_HOST}")
    private String dbHost;

    @Value("${DB_PORT}")
    private String dbPort;

    @Value("${DB_NAME}")
    private String dbName;

    @Value("${DB_USER}")
    private String dbUser;

    @Value("${DB_PASSWORD}")
    private String dbPassword;

    @Bean
    @Primary
    @ConditionalOnProperty(name = "DB_HOST")
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");

        // Construct standard MySQL JDBC URL with SSL safe for Aiven
        String jdbcUrl = String.format("jdbc:mysql://%s:%s/%s?sslMode=REQUIRED", dbHost, dbPort, dbName);

        dataSource.setUrl(jdbcUrl);
        dataSource.setUsername(dbUser);
        dataSource.setPassword(dbPassword);

        System.out.println("✅ Configured MySQL DataSource from DB_HOST environment variable: " + dbHost);

        return dataSource;
    }
}
