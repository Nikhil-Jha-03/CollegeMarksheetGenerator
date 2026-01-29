package com.nikhil.backend.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import com.nikhil.backend.entity.LeavingCertificate;

public class LeavingCertificateSpecification {

    public static Specification<LeavingCertificate> getLCSpecification(String search) {
        return (root, query, cb) -> {

           if (search == null || search.trim().isEmpty()) {
                return cb.conjunction();
            }

            String trimmedSearch = search.trim();
            String searchLike = "%" + trimmedSearch.toLowerCase() + "%";

            List<Predicate> predicates = new ArrayList<>();

            boolean isNumeric = trimmedSearch.matches("\\d+");

            /* ---------------- TEXT FIELDS (LIKE) ---------------- */

            predicates.add(cb.like(cb.lower(root.get("studentName")), searchLike));
            predicates.add(cb.like(cb.lower(root.get("standard")), searchLike));
            predicates.add(cb.like(cb.lower(root.get("uniqueIDAdhar")), searchLike));

            /* ---------------- NUMERIC FIELDS ---------------- */

            if (isNumeric) {
                Long numericValue = Long.parseLong(trimmedSearch);

                // Exact match for numeric columns
                predicates.add(cb.equal(root.get("id"), numericValue));
                predicates.add(cb.equal(root.get("grNo"), numericValue));
                predicates.add(cb.equal(root.get("studentID"), numericValue));
            } else {
                // Fallback LIKE if they are stored as String
                predicates.add(cb.like(cb.lower(root.get("grNo")), searchLike));
                predicates.add(cb.like(cb.lower(root.get("studentID")), searchLike));
            }

            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }
}