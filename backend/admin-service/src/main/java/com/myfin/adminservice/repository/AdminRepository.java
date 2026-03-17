package com.myfin.adminservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.myfin.adminservice.entity.Admin;

public interface AdminRepository
        extends JpaRepository<Admin, Long> {
    Admin findByEmail(String email);
}
