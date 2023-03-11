# Self local Docker image build

## Motivation: what this action is designed for

Ease the building of a local docker image for nested docker in a github action workflow

I often found myself writing this kind of steps in a CI action description:

```yaml
<...>
- name: build test-one image
  run: docker build -t test:one ./tests/test-one-image-dir

- name: run test-one
  run: docker run --rm test:one java -jar app.jar arg1 arg2 arg3 
```

This action aims to normalize the build phase. A secondary goal is to add some validations tests like those performed by [GoogleContainerTools/container-structure-test](https://github.com/GoogleContainerTools/container-structure-test)

## Non-motivation: what this action is not designed for

+ Logging to a custom repository
+ Publishing the built images 

## Supported architecture

This action is tested on ubuntu-latest and windows-latest.
**NB:** It is not possible to cross-build images, e.g. a windows runner can only build windows-based images.

## Usage
```yaml
    steps:
      - name: Checkout # Do not forget to checkout your repository ...
        uses: actions/checkout@v3

      - name: Build image
        uses: NyuB/self-docker-action@1.0
        with:
          build-dir: ./images/dev-env # relative to root of repository
          image-name: dev
          image-tag: latest
          dockerfile-path: ./images/Dockerfile # optional, (defaults to <build-dir>/Dockerfile)
      
      - name: Use image
        run: docker run --rm dev:latest echo "BRAVO" # image available under <image-name>:<image-tag>
```
