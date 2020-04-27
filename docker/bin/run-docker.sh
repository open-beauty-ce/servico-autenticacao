#!/bin/bash

NOME_REDE="autenticacao"
TEM_REDE_AGENDA="$(docker network ls -f name=^$NOME_REDE$ | grep $NOME_REDE)"

if [[ $TEM_REDE_AGENDA == "" ]]; then
  docker network create $NOME_REDE > /dev/null
fi

docker-compose up -d
