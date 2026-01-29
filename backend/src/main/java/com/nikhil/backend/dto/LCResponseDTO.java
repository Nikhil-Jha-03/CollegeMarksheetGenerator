package com.nikhil.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class LCResponseDTO {

    private Long id;
    private String studentType;
    private String grNo;
    private Boolean isDuplicate;
    private String studentPEN;
    private String uniqueIDAdhar;
    private String studentApaarID;
    private String studentID;
    private String studentName;
    private String standard;


}
