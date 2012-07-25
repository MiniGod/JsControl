JsControl
=========
ManiaPlanet XML-RPC (Server controller) in Node.JS for both TrackMania 2 and ShootMania.

Installation instructions
=========
1. [Install Node.JS](http://nodejs.org/)
2. Download JsControl and extract it somewhere
3. Rename *Plugins_SM* **or** *Plugins_TM* to *Plugins*, according to the game you use.
4. Rename *config.sampleSM.js* **or** *config.sampleTM.js* to *config.js*, according to the game you use.
5. Open the just renamed *config.js* and set the four upper settings correctly.
6. Install MySQL and set up a database. Execute the *Sql/mysql.sql* file on the just made MySQL database.
7. Set the correct values in *config_database.js*.
8. Execute *'node controller.js'* in the directory the *controller.js* is inside. You can also just run *Run.bat* if you're using Windows.

Dependencies
=========
All dependencies are included with the download.
* [sax](http://search.npmjs.org/#/sax).
* [xmlbuilder](http://search.npmjs.org/#/xmlbuilder) (required for partial use of xmlrpc)
* [xmlrpc](http://search.npmjs.org/#/xmlrpc) (partial - serializer and deserializer, modified)
* [mysql](https://github.com/felixge/node-mysql/) (database)

Contributions
=========
Thanks to [friedr1c3](https://github.com/friedr1c3) for inspiration and several code snippets for the core.
More contributions and support is always wanted :).