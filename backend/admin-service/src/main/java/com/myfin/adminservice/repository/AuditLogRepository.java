package com.myfin.adminservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.myfin.adminservice.entity.AuditLog;
import java.util.List;

@Repository
public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    // Get logs by admin
    List<AuditLog> findByAdminIdOrderByTimestampDesc(Long adminId);

    // Get all logs newest first
    List<AuditLog> findAllByOrderByTimestampDesc();
}