package bot

import (
	"fmt"
	"github.com/go-redis/redis"
	"github.com/michaellee8/telebot"
)

type Server struct {
	usersDbClient  *redis.Client
	statusDbClient *redis.Client
	bot            *telebot.Bot
}

func (server *Server) Init() error {

	server.usersDbClient = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf(
			"%s:%s",
			RetrieveEnv("USERS_DB_HOST", "ssdb-users"),
			RetrieveEnv("USERS_DB_PORT", "8888"),
		),
	})
	server.statusDbClient = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf(
			"%s:%s",
			RetrieveEnv("STATUS_DB_HOST", "ssdb-status"),
			RetrieveEnv("STATUS_DB_PORT", "8888"),
		),
	})

}

func (server *Server) RegisterCommands() {

}
