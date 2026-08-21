CREATE TABLE `waitlist_conversion_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`eventType` varchar(64) NOT NULL DEFAULT 'waitlist_joined',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waitlist_conversion_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waitlist_rate_limits` (
	`identifier` varchar(64) NOT NULL,
	`attempts` int NOT NULL DEFAULT 1,
	`windowStartedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `waitlist_rate_limits_identifier` PRIMARY KEY(`identifier`)
);
