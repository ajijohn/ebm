
## Introduction
#### UI for Microclimatic data for ecological forecasting

[![Build Status](https://travis-ci.org/trenchproject/ebm.svg)](https://travis-ci.org/trenchproject/ebm)

## API Reference

Refer to 

* [R API ]https://github.com/trenchproject/microclimRapi
* [Python API] https://github.com/trenchproject/microclim-api

API keys are to requested prior to interacting with APIs.

## Binder
Jupyter+R: [![Binder](http://mybinder.org/badge.svg)](http://beta.mybinder.org/v2/gh/trenchproject/ebm/master?filepath=index.ipynb)

## Requirements

* [NodeJs](http://nodejs.org) >= 6.x

## Configurations

```sh
setup auth.js with API Keys for Google/Twitter/LinkedIn
```
## Dependencies
Needs MongoDB

```sh
sudo apt install -y mongodb
```

Verify the service’s status:
```sh
sudo systemctl status mongodb
```
To restart MongoDB

```sh
sudo systemctl restart mongodb
```


## Install

```sh
$ git clone git://github.com/trenchproject/ebm.git
$ cd ebm
$ npm install

```
if not found/npm not installed - do the below for Ubuntu

```sh
sudo apt update
sudo apt install nodejs
sudo apt install npm
```

Check the node version

```sh
nodejs -v
```

We have tested on 10.19

```sh
$ npm start

$ npm install -g forever
```

Then visit [http://localhost:3000/](http://localhost:3000/)

## Communication

Once filtering is done via the microclim.org site, an email will be delivered to your mailbox with the details of the extracted file.

[![N|Solid](http://microclim.org/images/email-corres.png)]()


## Usage 

Note the link from the previous section, and to use the NetCDF file, see the vignette below

```sh
# author - Aji John
# credit - http://geog.uoregon.edu/bartlein/courses/geog607/Rmd/netCDF_01.htm


library(chron)
library(RColorBrewer)
library(lattice)
library(ncdf4)

url="http://s3-us-west-2.amazonaws.com/microclim/58741743311c3c0e99dac83d/BGAP_output_interval-daily_aggregation-avg_times-19810101-19810122_created-2017-01-09-2316.nc"
dfile="BGAP_output_interval-daily_aggregation-avg_times-19810101-19810122_created-2017-01-09-2316.nc"

download.file(url, destfile=dfile)

# open a NetCDF file
ncin <- nc_open(dfile)
print(ncin)

lon <- ncvar_get(ncin, "lon")
nlon <- dim(lon)
head(lon)

lat <- ncvar_get(ncin, "lat", verbose = F)
nlat <- dim(lat)
head(lat)

#Number of colums - would be 2 by 2 matrix
print(c(nlon, nlat))

# Number of days multiplied by the granularity (hourly/daily etc)
t <- ncvar_get(ncin, "time")
tunits <- ncatt_get(ncin, "time", "units")
nt <- dim(t)

dname <- "BGAP"  # note: specific to the variabe being s  seclected
tmp.array <- ncvar_get(ncin, dname)

dlname <- ncatt_get(ncin, dname, "long_name")
dunits <- ncatt_get(ncin, dname, "units")
fillvalue <- ncatt_get(ncin, dname, "_FillValue")
dim(tmp.array)

# print the global variables
# reconfirm what was used to filter

created <- ncatt_get(ncin, 0, "createdOn")
startdate <- ncatt_get(ncin, 0, "startdate")
enddate <- ncatt_get(ncin, 0, "enddate")
varname <- ncatt_get(ncin, 0, "varname")

```

## Tests

```sh
$ npm test
```

## DOI
[![DOI](https://zenodo.org/badge/67786449.svg)](https://zenodo.org/badge/latestdoi/67786449)

## License

Apache