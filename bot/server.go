package main

import (
	"context"
	"fmt"
	"github.com/go-redis/redis"
	pb "github.com/michaellee8/moodle-puppeteer-tg-bot/bot/pb"
	"github.com/michaellee8/telebot"
	"google.golang.org/grpc"
	"log"
	"net"
	"time"
)

type Server struct {
	usersDbClient  *redis.Client
	statusDbClient *redis.Client
	bot            *telebot.Bot
}

type botService struct {
	server *Server
}

func (service *botService) OnStatusUpdate(context.Context, *pb.Empty) (*pb.Empty, error) {
	service.server.Broadcast()
	return nil, nil
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
	bot, err := telebot.NewBot(telebot.Settings{
		Token:  RetrieveEnv("TELEGRAM_BOT_TOKEN", ""),
		Poller: &telebot.LongPoller{Timeout: 10 * time.Second},
	})
	if err != nil {
		return err
	}
	lis, err := net.Listen("tcp", "0.0.0.0:12345")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	pb.RegisterBotServer(grpcServer, &botService{server: server})
	err = grpcServer.Serve(lis)
	if err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
	server.bot = bot
	return nil
}

func (server *Server) RegisterCommands() {
	server.bot.Handle("start", func(m *telebot.Message) {
		_, err := server.bot.Send(m.Sender, "Welcome to this Moodle monitoring bot", nil)
		if err != nil {
			return
		}
		uid := string(m.Sender.ID)
		u, err := server.GetOrAdd(uid)
		if err != nil {
			return
		}
		_, err = server.bot.Send(m.Sender, fmt.Sprintf("Hello user with Telegram user ID %s, you are registered as %s now.", u.uid, u.role))
		if err != nil {
			return
		}
	})
	server.bot.Handle("status", func(m *telebot.Message) {
		s, err := server.GetStatus()
		if err != nil {
			return
		}
		_, err = server.bot.Send(m.Sender, fmt.Sprintf("%+v", s))
		_, err = server.bot.Send(m.Sender, fmt.Sprintf("Last update is %s s ago", time.Since(s.lastUpdate)))
	})
	server.bot.Handle("brodcast", func(_ *telebot.Message) {
		server.Broadcast()
	})
}

type MsgTarget struct {
	id string
}

func (t *MsgTarget) Recipient() string {
	return t.id
}

func (server *Server) Broadcast() {
	s, err := server.GetStatus()
	if err != nil {
		log.Println(err)
		return
	}
	var r string
	if s.haveQuiz {
		r = "Have"
	} else {
		r = "No"
	}
	err = server.ForEachUsers(func(uid string, role string) error {
		_, err := server.bot.Send(&MsgTarget{id: uid}, fmt.Sprintf("%s quiz now.", r))
		if err != nil {
			log.Println(err)
			return nil
		}
		return nil
	})
	if err != nil {
		log.Println(err)
		return
	}
	return
}
