exports.up = async (sql) => {
  await sql`
	  INSERT INTO tickets (name,capacity,waiting_list) VALUES   									
			  ('partyPass',250,100)
	  `;
};

exports.down = async (sql) => {
  await sql`
			  DELETE FROM tickets
	`;
};
