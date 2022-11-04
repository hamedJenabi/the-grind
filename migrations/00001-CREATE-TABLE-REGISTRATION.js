exports.up = async (sql) => {
  await sql`
	CREATE TABLE registrations(
			id SERIAL PRIMARY KEY, 
			date VARCHAR(255) NOT NULL,
			status VARCHAR(255) NOT NULL,
			firstname VARCHAR (100) NOT NULL, 
			lastname VARCHAR (100) NOT NULL, 
			email VARCHAR NOT NULL, 
			ticket VARCHAR NOT NULL,
			role VARCHAR (100),
			country VARCHAR, 
			price VARCHAR (100),
			terms boolean
	)
	`;
};

exports.down = async (sql) => {
  await sql`
		DROP TABLE registrations
		`;
};
