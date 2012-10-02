JsControl
=========
ManiaPlanet XML-RPC (Server controller) in Node.JS for both TrackMania 2 and ShootMania.

Installation instructions
=========
1. [Install Node.JS](http://nodejs.org/)
2. Download JsControl and extract it somewhere
3. Execute `npm install`.
4. Rename `config/config.sample.json` to `config/config.json`.
5. Open & configure `config/config.json`.
6. *(skip this step for now - not implemented in JsControl Classy0.0.1)*  
   Install MySQL and set up a database. Execute the `mysql.sql` file on the just made MySQL database.
7. *(skip this step for now - not implemented in JsControl Classy0.0.1)*  
   Set the correct values in `config/config_database.js`.

To run it
=========
Execute `node .`

Dependencies
=========
* [gbxremote](http://search.npmjs.org/#/gbxremote) (connection to the server)
* [mysql](https://github.com/felixge/node-mysql/) (database)

Contributions
=========
Thanks to [friedr1c3](https://github.com/friedr1c3) for inspiration and several code snippets for the core.
More contributions and support is always wanted :).