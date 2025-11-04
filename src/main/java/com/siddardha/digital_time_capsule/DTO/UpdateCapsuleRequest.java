package com.siddardha.digital_time_capsule.DTO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateCapsuleRequest {

    private String title;

    private String message;

    private LocalDateTime unlockDateTime;
}
