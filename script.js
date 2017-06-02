
var app = angular.module('rkApp', []);

app.controller('TodoListController', ['$scope', function($scope) {

    $scope.points = [[0,0],
                     [0.785391, 0.707107],
                     [1.570796, 1],
                     [2.356194, 0.707107],
                     [3.141593,0]];

    $scope.arrayA = [];
    $scope.arrayB = [];

    $scope.n = 5;

    $scope.finished = false;

    $scope.resultsPoints = [[0,0,0,0],
                            [0,0,0,0],
                            [0,0,0,0],
                            [0,0,0,0]];

    // principal function with the main loop

    $scope.start = function(){

        let resultFunctionsString = [];

        $scope.finished = false;

        // define c. matrix (4 x 4)

        $scope.arrayA = [];

        for (let i = 0; i < $scope.points.length; i++) {
            $scope.arrayA.push( [ math.pow($scope.points[i][0], 3), math.pow($scope.points[i][0], 2), $scope.points[i][0], 1 ]);
        }

        // define results array ( 4 x 1)

        $scope.arrayB = [];

        for (let i = 0; i < $scope.points.length; i++) {
            $scope.arrayB.push($scope.points[i][1]);
        }

        // find H and it's points
        
        for (let cont=0; cont < $scope.n - 1; cont++) {

            let h = undefined;
            let xarray = [];

            // pace
            h = (($scope.points[cont+1][0] - $scope.points[cont][0]) / 5);

            // console.log(h);

            // find all the sub points make the interpolation
            xarray.push((h*1) + $scope.points[cont][0]);
            xarray.push((h*2) + $scope.points[cont][0]);
            xarray.push((h*3) + $scope.points[cont][0]);
            xarray.push((h*4) + $scope.points[cont][0]);

            // find all the "Y" of the subpoints with lagrange
            let tempLGres = [[0],[0],[0],[0]];
            // for (let k = 0; k <= 3; k++) {

            //     // console.log("i:"+cont + " k"+k+ " x[k]"+ xarray[k]);
            //     tempLGres.push();
            //     // console.log($scope.lagrange($scope.points, $scope.n, xarray[k]));
            // }

            let leftArray =  $scope.defineEmptyMatrix(4,4);
            
            //define left c. matrx 
            for(let kcount=3; kcount>=0; kcount--){

                //first right column aways equals 1                
                leftArray[kcount][3] = 1;
                for(let jcount=2;jcount>=0;jcount--){
                    leftArray[kcount][jcount] = leftArray[kcount][jcount+1]*xarray[kcount];
                }
                

                tempLGres[kcount][0] = $scope.lagrange($scope.points, $scope.n, xarray[kcount]);
            }

            let Y;
            let X;

            let L = $scope.defineEmptyMatrix(4,4);
            let U = $scope.defineEmptyMatrix(4,4);
            
            $scope.Metodo_LU(leftArray,L,U,4);

            // console.log("A");
            // console.log(leftArray);
            
        // console.log("uTemp");
        // console.log(U);
        // console.log("L");
        // console.log(L);

            Y = $scope.Calcula_Y(L,tempLGres,4);
            X = $scope.Calcula_X(U,Y,4);

            // console.log("Y");
            // console.log(Y);
            
            for(let k=0; k<4; k++){
                $scope.resultsPoints[cont][k] = X[k][0];
            }

            console.log("y = (" + Math.round10(X[0][0], -6)+ ")x^3 + " + "(" + Math.round10(X[1][0], -6)+ ")x^2 + " + Math.round10(X[2][0], -6) + "x + "+ Math.round10(X[3][0], -6));

            resultFunctionsString.push({
                fn: "y = (" + Math.round10(X[0][0], -6)+ ")x^3 + " + "(" + Math.round10(X[1][0], -6)+ ")x^2 + " + Math.round10(X[2][0], -6) + "x + "+ Math.round10(X[3][0], -6)
              });

        }

        console.log($scope.resultsPoints);
        $scope.plot(resultFunctionsString);
        $scope.finished = true;
    }

    $scope.lagrange = function(lgpontos, lgn, x){

        let a = 0;
        let b;
        let aux;
    
        for(let index=0; index < lgn; index++){
            
            b = 1;

            for(let j=0; j < lgn; j++){
                
                if(j != index){
                    aux = ((x - lgpontos[j][0]) / (lgpontos[index][0] - lgpontos[j][0]));
                    b = b * aux;
                }
            }

            a = a + (lgpontos[index][1] * b);
        }

        return Math.round10(a, -6);
    }

    $scope.plot = function(resultStrings){ 

        let functions = resultStrings;

        functions.push({
            points: $scope.points,
            fnType: 'points',
            graphType: 'scatter'
        });

        functionPlot({
          target: "#plotter",
          data: functions,
          grid: true
        });
    }

    $scope.Metodo_LU = function(A, L, U, n){

        let uTemp = U;

        let pivo;
        let mult;
        
        for(let iIndex=0; iIndex<n; iIndex++){
            for(let jIndex=0; jIndex<n; jIndex++){
                uTemp[iIndex][jIndex] = A[iIndex][jIndex];
            }
        }


        for(let i=0; i<n-1; i++){
            pivo = uTemp[i][i];
            for(let j=i+1; j<n; j++){
                if(uTemp[j][i] != 0){
                    mult = (-1) * Math.round10(uTemp[j][i],-6) / Math.round10(pivo,-6);
                    L[j][i] = mult * (-1);
                    for(let k=0; k<n; k++){
                        uTemp[j][k] = Math.round10((Math.round10(uTemp[j][k],-6) + Math.round10(mult,-6) * Math.round10(uTemp[i][k],-6)), -6);
                    }
                }
            }
        }

        for(let i=0; i<n; i++){
            for(let j=0; j<n; j++){
                if(i == j)
                    L[i][j] = 1;
                else if(i < j)
                    L[i][j] = 0;
            }
        }

        U = uTemp;

        // console.log("uTemp");
        // console.log(uTemp);
        // console.log("L");
        // console.log(L);
    }

    $scope.Calcula_Y = function(L, B, n){

        let Y = $scope.defineEmptyMatrix(n,1);
        let aux;

        for(let i=0; i<n; i++){
            aux = B[i];
            for(let j=0; j<i; j++){
                aux = aux - ( L[i][j]*Y[j][0] );
            }
            Y[i][0] = aux/L[i][i];
            // console.log("Y[i][0] " + Y[i][0]);
        }

        // console.log("calcula y");
        // console.log("L");
        // console.log(L);
        // console.log("B");
        // console.log(B);
        // console.log("n");
        // console.log(n);

        return Y;
    }

    $scope.Calcula_X = function(U, Y, n){

        // console.log("calcula X");
        // console.log("U");
        // console.log(U);
        // console.log("Y");
        // console.log(Y);
        // console.log("n");
        // console.log(n);

        let X = $scope.defineEmptyMatrix(n,1);
        let aux;

        for(let i=n-1; i>=0; i--){
            aux = Y[i];
            for(let j=n-1; j>i; j--){
                aux = aux - ( U[i][j]*X[j][0] );
            }
            X[i][0] = aux/U[i][i];
            // console.log("X[i][0] " + X[i][0]);

        }

        return X;
    }

    $scope.defineEmptyMatrix = function(x, y){

        let eMatrix = [];

        for(let i=0; i <= x-1; i++){
            eMatrix.push([]);
            for(let j=0; j <= y-1; j++){
                eMatrix[i].push(0);
            }
        }

        return eMatrix;
    }

  }]);

/**
     * Decimal adjustment of a number.
     *
     * @param   {String}    type    The type of adjustment.
     * @param   {Number}    value   The number.
     * @param   {Integer}   exp     The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number}            The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function(value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
    // Decimal floor
    if (!Math.floor10) {
        Math.floor10 = function(value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }
    // Decimal ceil
    if (!Math.ceil10) {
        Math.ceil10 = function(value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }