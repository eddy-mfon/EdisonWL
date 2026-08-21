ALTER TABLE `waitlist_submissions` MODIFY COLUMN `fullName` varchar(160) NOT NULL DEFAULT 'Anonymous';--> statement-breakpoint
ALTER TABLE `waitlist_submissions` MODIFY COLUMN `role` varchar(64) NOT NULL DEFAULT 'Waitlist';--> statement-breakpoint
ALTER TABLE `waitlist_submissions` MODIFY COLUMN `problem` text NOT NULL DEFAULT ('No suggestion provided');