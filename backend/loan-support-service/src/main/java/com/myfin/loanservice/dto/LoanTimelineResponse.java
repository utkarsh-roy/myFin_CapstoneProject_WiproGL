package com.myfin.loanservice.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanTimelineResponse {
    private Long id;
    private Long loanId;
    private String status;
    private String description;
    private LocalDateTime timestamp;
}