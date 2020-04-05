-- rambler up

CREATE TABLE listing (
	id VARCHAR(255),
	url VARCHAR(512),

	title VARCHAR(255),
	address VARCHAR(255),
	category VARCHAR(255),
	image_url VARCHAR(512),
	meta TEXT,

	PRIMARY KEY (id)
);

-- rambler down

DROP TABLE listing;
