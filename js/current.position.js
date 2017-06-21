define(['moment', 'turf', 'leaflet', 'moment-timezone'], function (moment, turf, L) {

    var EnumActivity = {
        OTHER: 0,
        WORKING: 1
    };

    window.moment = moment;

    moment.locale('pt-br');

    var PONTOSTRABALHO = [[-47.81537532806397,-21.208268910028956],[-47.81508564949036,-21.208118877115016],[-47.81466722488404,-21.20805886390675],[-47.814098596572876,-21.20805886390675],[-47.81375527381897,-21.20815888590698],[-47.81342267990112,-21.20838893625033],[-47.81317591667176,-21.208879042308347],[-47.81320810317993,-21.209469167852124],[-47.813293933868415,-21.20984924746203],[-47.81387329101563,-21.210219324036785],[-47.81449556350709,-21.21042936708547],[-47.81535387039185,-21.210559393584916],[-47.81567573547363,-21.21042936708547],[-47.815793752670295,-21.21010930136822],[-47.815793752670295,-21.209719220337174],[-47.81566500663757,-21.209289129800666],[-47.815568447113044,-21.208929053039125],[-47.81551480293274,-21.208628988400392],[-47.81537532806397,-21.208268910028956]];

    var dateTest = null; //'11/05/2017'; // DD/MM/YYYY

    var CurrentPosition = function (featureGroup) {

        var self = this;

        var ignoreSundays = true;
        var ignoreSaturdays = true;

        this.changeActivityData;
        this.changeActivityCount = 0;

        this.changeActivityTolerance = 10; // ~10min
        this.currentActivity = EnumActivity.OTHER;

        this.latitude;
        this.longitude;
        this.accuracy;

        //this.date = new moment();
        //this.date = setTimezone(new DateTimeZone('America/Sao_Paulo'));

        // pega a região que trabalha
        this.areaTrabalho = new L.Polygon(PONTOSTRABALHO).toGeoJSON();
        this.setWorkplace = function (geoJson) {
            self.areaTrabalho = geoJson;
        };

        var previousStatus = false;

        this.updatePosition = function(latitude, longitude, accuracy, timestampMs) {

            this.latitude = latitude;
            this.longitude = longitude;
            this.accuracy = Number(accuracy);
            var date = new moment(Number(timestampMs));
            var dayOfWeek = Number(date.format('E'));

            if (accuracy > 500 || // ignora se precisão de localização for ruim
                (ignoreSaturdays && dayOfWeek === 6) || // ignore se sábado
                (ignoreSundays && dayOfWeek === 7)) // ignora se domingo
            {
                return { latLng: [this.latitude, this.longitude], accuracy: this.accuracy, status: 'ignored' };
            }


            // debugando:
            if (dateTest) {
                // 25/04/17
                // 09:04 --- 12:10
                // 12:01 --- 17:34
                // ---------------
                // 24/07/2017
                // 09:25 --- 12:08
                // 13:08 --- 18:36
                var dateCompare = date.format('DD/MM/YYYY');
                if (dateCompare === dateTest) {
                    console.log(date.format('hh:mm:ss'), accuracy, this.isWorking(true));
                }
            }
            // f. debug

            if (previousStatus !== this.isWorking()) {
                this.changeActivityCount = 0;
            }
            previousStatus = this.isWorking();

            // altera atividade de acordo com a tolerância
            if (this.isWorking()) {

                if (this.currentActivity !== EnumActivity.WORKING) {
                    // mudou para trabalho
                    if (this.changeActivityCount === 0) {
                        this.changeActivityData = date;
                    }
                    this.changeActivityCount++;
                    if (this.changeActivityCount > this.changeActivityTolerance) {
                        this.currentActivity = EnumActivity.WORKING;
                        this.printChangeActivity();
                        this.changeActivityCount = 0;
                    }
                }
            } else {
                // if (this.currentActivity === EnumActivity.WORKING) {
                //     this.changeActivityCount = 0;
                // }
                if (this.currentActivity !== EnumActivity.OTHER) {
                    // mudou para FORA do trabalho
                    if (this.changeActivityCount === 0) {
                        this.changeActivityData = date;
                    }
                    this.changeActivityCount++;
                    if (this.changeActivityCount > this.changeActivityTolerance) {
                        this.currentActivity = EnumActivity.OTHER;
                        this.printChangeActivity();
                        this.changeActivityCount = 0;
                    }
                }
            }

            return { latLng: [this.latitude, this.longitude], accuracy: this.accuracy, status: this.currentActivity };
        };

        var day = function () {
            this.date = ''; //'10/10/2015';
            this.monthYear = ''; // 10/2015
            this.periods = []; //[{ start: '10:12', end: '12:10'}, { start: '15:50', end: '18:90' }];
            this.totalWorkMs = function () {
                var i = 0;
                var periods = this.periods;
                var periodsLength = periods.length;
                var total = 0;
                for (i; i < periodsLength;) {
                    // todo: somar tempo entre períodos
                    // periods[i];
                    i = i + 1;
                }
                return total;
            };
        };
        var period = function () {
          this.start = '';
          this.end = '';
        };


        var previousDay = 0;
        var arrDays = [];

        this.getWorkDays = function () {
            return arrDays;
        };

        var getFirstPeriodStartTimeMs = function (day) {

        };
        var getLastPeriodEndTimeMs = function (day) {

        };

        var _day = null;
        var _period = null;
        var _periods = [];
        var _averageStartTimeMs = 0;
        var _averageEndTimeMs = 0;
        var _totalWorkTimeMs = 0;
        var _totalWorkDays = 0;
        this.printChangeActivity = function() {
            var currentDay = this.changeActivityData.format('DD/MM/YYYY');
            var month = this.changeActivityData.get('month') + 1;
            var currentAverageStartTimeMs = 0;
            var currentAverageEndTimeMs = 0;

            if (previousDay !== currentDay) {
                _day = new day();
                _day.periods = _periods;
                _day.date = currentDay;
                _day.monthYear = this.changeActivityData.format('MMMM/YYYY');
                currentAverageStartTimeMs = getFirstPeriodStartTimeMs(_day);
                currentAverageEndTimeMs = getLastPeriodEndTimeMs(_day);
                if (previousDay === 0) {
                    // cal
                } else {
                    arrDays.push(_day);
                    _averageStartTimeMs = 0; // média: currentAverageStartTimeMs / _averageStartTimeMs
                    _averageEndTimeMs = 0; // média: currentAverageEndTimeMs / _averageEndTimeMs
                    _totalWorkTimeMs = _day.totalWorkMs();
                }
                _totalWorkDays++;
                // reinicia
                _periods = [];
                previousDay = currentDay;
            }

            if (this.currentActivity === EnumActivity.WORKING) {
                _period = new period();
                _period.end = this.changeActivityData.format('HH:mm');
            } else {
                _period.start = this.changeActivityData.format('HH:mm');
                _periods.push(_period);
            }
        };

        this.getDate = function () {
            return this.date;
        };

        this.isWorking = function (debug) {
            var debugging = debug ? debug : false;
            var $currentCoordinate = turf.point([this.longitude, this.latitude]);
            var atWork = turf.inside($currentCoordinate, self.areaTrabalho);
            if (debugging) {
                console.log($currentCoordinate, self.areaTrabalho);
                featureGroup.addData($currentCoordinate);
            }
            return atWork;
        };

    };

    return CurrentPosition;
});


