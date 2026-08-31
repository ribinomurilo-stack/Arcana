CREATE TABLE `drawingStatusOverrides` (
	`drawingId` varchar(180) NOT NULL,
	`status` enum('Disponível','Reservado','Indisponível') NOT NULL,
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drawingStatusOverrides_drawingId` PRIMARY KEY(`drawingId`)
);
