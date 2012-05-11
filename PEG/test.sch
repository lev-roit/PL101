;; Factorial function
(define factorial           ;; factorial function 'string1' %% ## "string2"
    (lambda (n)
        (if (= n 0) 1
            (* n (factorial (- n 1))))))

(define factorial1
    (lambda (n)
        (if (= n 0) 1
            (* n (factorial1 (- n 1))))))

abcde 1 '2 '(3 4 5) 'x

;; Factorial function
(define factorial2
    (lambda (n)
        (if (= n 0) 1
            (* n (factorial2 (- n 1))))))

;; End comment