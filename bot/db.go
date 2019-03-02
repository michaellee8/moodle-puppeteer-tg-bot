package main

import (
	"encoding/json"
	"github.com/go-redis/redis"
	"github.com/pkg/errors"
	"strconv"
	"time"
)

type Status struct {
	haveQuiz   bool
	quizCount  int
	quizItems  []string
	lastUpdate time.Time
}

const (
	RoleAdmin = "admin"
	RoleUser  = "user"
)

func (server *Server) GetStatus() (Status, error) {
	s := Status{}
	res, err := server.statusDbClient.Get("haveQuiz").Result()
	if err != nil {
		return s, errors.WithStack(err)
	}
	b, err := strconv.ParseBool(res)
	if err != nil {
		return s, errors.WithStack(err)
	}
	s.haveQuiz = b
	res, err = server.statusDbClient.Get("quizCount").Result()
	if err != nil {
		return s, errors.WithStack(err)
	}
	i, err := strconv.ParseInt(res, 0, 0)
	if err != nil {
		return s, errors.WithStack(err)
	}
	s.quizCount = int(i)
	res, err = server.statusDbClient.Get("quizItems").Result()
	if err != nil {
		return s, errors.WithStack(err)
	}
	err = json.Unmarshal([]byte(res), &s.quizItems)
	if err != nil {
		return s, errors.WithStack(err)
	}
	res, err = server.statusDbClient.Get("lastUpdate").Result()
	if err != nil {
		return s, errors.WithStack(err)
	}
	var sd string
	err = json.Unmarshal([]byte(res), &sd)
	if err != nil {
		return s, errors.WithStack(err)
	}
	d, err := time.Parse(time.RFC3339, sd)
	if err != nil {
		return s, errors.WithStack(err)
	}
	s.lastUpdate = d
	return s, nil
}

func (server *Server) ForEachUsers(fun func(uid string, role string) error) error {
	res, err := server.usersDbClient.Do("keys", "", "", 100000).Result()
	if err != nil {
		return errors.WithStack(err)
	}
	ss := res.([]interface{})
	for _, iv := range ss {
		uid := iv.(string)
		role, err := server.usersDbClient.Get(uid).Result()
		if err != nil {
			return errors.WithStack(err)
		}
		err = fun(uid, role)
		if err != nil {
			return err
		}
	}

	return nil
}

type User struct {
	uid  string
	role string
}

func (server *Server) AddUser(uid, role string) error {
	err := server.usersDbClient.Set(uid, role, 0).Err()
	if err != nil {
		return errors.WithStack(err)
	}
	return nil
}

func (server *Server) GetUser(uid string) (User, error) {
	role, err := server.usersDbClient.Get(uid).Result()
	if err != nil {
		return User{}, err
	}
	return User{
		role: role,
		uid:  uid,
	}, nil
}

func (server *Server) GetOrAdd(uid string) (User, error) {
	u, err := server.GetUser(uid)
	if err == redis.Nil {
		err = server.AddUser(uid, RoleUser)
		if err != nil {
			return User{}, err
		}
		return server.GetUser(uid)
	} else if err != nil {
		return User{}, err
	} else {
		return u, nil
	}
}

func (server *Server) SetUserRole(uid, role string) error {
	return server.usersDbClient.Set(uid, role, 0).Err()
}
