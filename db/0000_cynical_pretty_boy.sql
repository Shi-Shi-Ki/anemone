-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `todos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`title` varchar(255) NOT NULL,
	`content` text,
	`is_completed` int,
	`update_time` datetime,
	`create_time` datetime,
	CONSTRAINT `todos_id_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`staff_code` varchar(5),
	`update_time` datetime,
	`create_time` datetime,
	CONSTRAINT `users_id_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `fk_user_id` ON `todos` (`user_id`);--> statement-breakpoint
ALTER TABLE `todos` ADD CONSTRAINT `todos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
*/