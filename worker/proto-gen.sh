grpc_tools_node_protoc \
--js_out=import_style=commonjs,binary:./grpc/ \
--grpc_out=./grpc \
--plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` \
--proto_path=../ \
../moodle-puppeteer-tg-bot.proto