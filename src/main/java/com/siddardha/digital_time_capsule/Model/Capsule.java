package com.siddardha.digital_time_capsule.Model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "capsules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Capsule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String message;

    private String filePath;

    private LocalDateTime unlockDateTime;

    private boolean unlocked = false;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
