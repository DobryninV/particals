
import React, { useState, useCallback, useEffect } from 'react';
import { FadeComponent } from '../../components';
import { Sketch } from '../../gCore/main';
import styles from './MainPage.module.css';

const DALAY = 1.5

const scetch = new Sketch(DALAY);

export const MainPage = () => {

    useEffect(() => {
        scetch.start()
    }, [])

    return (
        <div className={styles.container}>
            <div id="container"></div>
        </div>
    )
}