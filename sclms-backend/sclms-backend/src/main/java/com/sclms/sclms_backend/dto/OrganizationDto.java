package com.sclms.sclms_backend.dto;

public class OrganizationDto {
    private String name;

    public OrganizationDto() {}

    public OrganizationDto(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
