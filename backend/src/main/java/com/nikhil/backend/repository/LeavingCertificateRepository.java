package com.nikhil.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.nikhil.backend.entity.LeavingCertificate;

public interface LeavingCertificateRepository extends JpaRepository<LeavingCertificate, Long> , JpaSpecificationExecutor<LeavingCertificate> {}
