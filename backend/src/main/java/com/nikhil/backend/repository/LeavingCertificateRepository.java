package com.nikhil.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.nikhil.backend.entity.LeavingCertificate;

public interface LeavingCertificateRepository
        extends JpaRepository<LeavingCertificate, Long>, JpaSpecificationExecutor<LeavingCertificate> {
    boolean existsByUniqueIDAdharAndIdNot(String uniqueIDAdhar, Long id);

    boolean existsByGrNoAndIdNot(String grNo, Long id);

    boolean existsByUniqueIDAdhar(String uniqueIDAdhar);

    boolean existsByGrNo(String grNo);

}
