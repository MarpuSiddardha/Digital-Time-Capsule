package com.siddardha.digital_time_capsule.DTO;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

@Data
public class CapsuleResponse {
    private Long id;
    private String title;
    private String message;
    private boolean unlocked;
    private String unlockDateTime;
}
