package com.nikhil.backend.specification;

import org.springframework.data.jpa.domain.Specification;

import com.nikhil.backend.entity.Student;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;

import jakarta.persistence.criteria.Root;
import lombok.extern.slf4j.Slf4j;



@Slf4j

public class StudentSpecification {

    public static Specification<Student> getSpecification(String searchBy, String search) {

        return (Root<Student> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {

            if (searchBy == null || searchBy.isEmpty() || search == null || search.isEmpty()) {
                return cb.conjunction();
            }

            // Find the searchBy type using reflection
            Class<?> searchByType = root.get(searchBy).getJavaType();


            log.info("TYPE OF SEARCH TYPE = {}", searchByType);


            // If searchBy is numeric → convert and compare
            if (Number.class.isAssignableFrom(searchByType)) {
                try {
                    Long number = Long.parseLong(search);
                    return cb.equal(root.get(searchBy), number);
                } catch (NumberFormatException e) {
                    // If invalid number, return no records
                    return cb.disjunction();
                }
            }

            

            // If searchBy is string → do case-insensitive LIKE
            if (searchByType == String.class) {
                return cb.like(cb.lower(root.get(searchBy)), "%" + search.toLowerCase() + "%");
            }

            // Default: exact match
            return cb.equal(root.get(searchBy), search);
        };
    }

}
