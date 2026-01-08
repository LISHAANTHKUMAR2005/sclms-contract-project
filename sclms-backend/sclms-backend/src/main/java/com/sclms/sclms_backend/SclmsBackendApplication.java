package com.sclms.sclms_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SclmsBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SclmsBackendApplication.class, args);
    }
}
